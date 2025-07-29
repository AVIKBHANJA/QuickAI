import { clerkClient } from "@clerk/express";

// Middleware to check userId and hasPremiumPlan

export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    const hasPremiumPlan = await has({ plan: "premium" });

    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";

    // Set user data for Liveblocks and other routes
    req.user = {
      userId: userId,
      id: userId, // Some routes might expect 'id' instead of 'userId'
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    };

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
