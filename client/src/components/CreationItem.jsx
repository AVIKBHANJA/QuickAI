import React, { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({item}) => {

    const [expanded, setExpanded] = useState(false)

    // Type badge styling
    const getTypeBadge = (type) => {
        const typeConfig = {
            'article': { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-700', label: 'Article' },
            'blog-title': { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', label: 'Blog Title' },
            'image': { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', label: 'Image' },
            'social-media': { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-700', label: 'Social Media' },
            'resume-review': { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-700', label: 'Resume Review' }
        }
        
        const config = typeConfig[type] || { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700', label: type }
        
        return (
            <span className={`${config.bg} ${config.border} ${config.text} px-3 py-1 rounded-full text-xs font-medium border`}>
                {config.label}
            </span>
        )
    }

  return (
    <div onClick={()=> setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow'>
        <div className='flex justify-between items-center gap-4'>
            <div className='flex-1 min-w-0'>
                <h2 className='font-medium text-gray-900 truncate'>{item.prompt}</h2>
                <p className='text-gray-500 text-xs mt-1'>{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}</p>
            </div>
            {getTypeBadge(item.type)}
        </div>
        {
            expanded && (
                <div className='mt-4 pt-4 border-t border-gray-100'>
                    {item.type === 'image' ? (
                        <div>
                            <img src={item.content} alt="Generated image" className='mt-3 w-full max-w-md rounded-lg'/>
                        </div>
                    ) : (
                        <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
                            <div className='reset-tw prose prose-sm max-w-none'>
                                <Markdown>{item.content}</Markdown>
                            </div>
                        </div>
                    )}
                </div>
            )
        }
    </div>
  )
}

export default CreationItem
