import React from 'react';

interface EmailCardProps{
    from: string;
    subject: string;
    snippet: string;
    aiAnalysis?:{
        Importance?: string;
        Intent?: string;
        shortSummary?: string;
    };
    score?: number;
}

const EmailCard: React.FC<EmailCardProps> = ({
    from,
    subject,
    snippet,
    aiAnalysis,
    score
}) => {
    return(
        <div className='p-5 bg-white rounded-2xl shadow hover:shadow-lg transition-all border border-gray-100'>
            <div className='flex justify-between items-center mb-2'>
                <h3 className='font-semibold text-lg'>{subject}</h3>
                {score !== undefined && (
                    <span className='text-xs text-gray-500'>
                        {Math.round(score*100)}%
                    </span>
                )}
            </div>
            <p className='text-sm text-gray-600 mb-2'>{snippet}</p>
            <p className='text-xs text-gray-500 mb-2'><strong>From:</strong>{from}</p>
            {aiAnalysis && (
                <div className='mt-2 border-t pt-2 text-sm'>
                    <p><strong>Importance:</strong>{aiAnalysis.Importance}</p>
                    <p><strong>Intent:</strong>{aiAnalysis.Intent}</p>
                    <p><strong>Summary:</strong>{aiAnalysis.shortSummary}</p>
                </div>
            )}
        </div>
    )
}

export default EmailCard;