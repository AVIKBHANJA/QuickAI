import OpenAI from "openai";
import sql from "../configs/db.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== "premium") {
      await sql`
        UPDATE users 
        SET free_usage = GREATEST(free_usage - 1, 0)
        WHERE id = ${userId}
      `;
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== "premium") {
      await sql`
        UPDATE users 
        SET free_usage = GREATEST(free_usage - 1, 0)
        WHERE id = ${userId}
      `;
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(
      data,
      "binary"
    ).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish) 
        VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
      publish ?? false
    })`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const userId = req.user.id;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { object } = req.body;
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateSocialMedia = async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform, topic, targetAudience, tone, context } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    if (!platform || !topic || !targetAudience || !tone) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const PLATFORM_SPECS = {
      instagram: {
        maxLength: 2200,
        features: ["hashtags", "emojis", "mentions"],
        style: "visual-focused with engaging captions",
      },
      twitter: {
        maxLength: 280,
        features: ["hashtags", "mentions", "links"],
        style: "concise and attention-grabbing",
      },
      linkedin: {
        maxLength: 3000,
        features: ["mentions", "links", "formatting"],
        style: "professional and industry-focused",
      },
      threads: {
        maxLength: 500,
        features: ["mentions", "links"],
        style: "conversational and engaging",
      },
      discord: {
        maxLength: 2000,
        features: ["mentions", "emojis", "formatting"],
        style: "community-focused and interactive",
      },
      whatsapp: {
        maxLength: 65536,
        features: ["emojis", "formatting"],
        style: "direct and personal",
      },
      facebook: {
        maxLength: 63206,
        features: ["hashtags", "mentions", "links"],
        style: "engaging and shareable",
      },
      youtube: {
        maxLength: 5000,
        features: ["hashtags", "mentions", "links"],
        style: "visual and informative",
      },
    };

    const platformSpec = PLATFORM_SPECS[platform];

    const prompt = `Act as a professional social media content writer. Create a ${platform} post with the following details:

Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${tone}
Additional Context: ${context || topic}

Platform-specific requirements:
- Maximum length: ${platformSpec.maxLength} characters
- Style: ${platformSpec.style}
- Available features: ${platformSpec.features.join(", ")}

Please provide:
1. Optimized title for the post
2. The main post content, optimized for ${platform}'s style and length limits
3. Include all Relevant hashtags and search terms across the platform/search engines (if applicable)
4. Any platform-specific formatting recommendations

Ensure the content is engaging and appropriate for the platform's typical audience.`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) 
        VALUES (${userId}, ${`Generate ${platform} post about: ${topic}`}, ${content}, 'social-media')`;

    if (plan !== "premium") {
      await sql`UPDATE users 
        SET free_usage = free_usage + 1 
        WHERE id = ${userId}`;
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
