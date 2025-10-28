import elasticClient from "./elasticSearchClient.js";
import { listAndIndexEmails } from "./gmailService.js";

const INDEX_NAME = "emails";

export const createIndexIfNotExists = async () => {
    const indexExists = await elasticClient.indices.exists({
        index: INDEX_NAME,
    })
    if (!indexExists){
        await elasticClient.indices.create({
            index: INDEX_NAME,
            mappings: {
                properties: {
                    from: {type: 'text'},
                    to: {type: 'text'},
                    subject: {type: 'text'},
                    date: {type: 'date'},
                    snippet: {type: 'text'},
                    body: {type: 'text'},
                    aiAnalysis: {
                        properties:{
                            Importance: {type: 'keyword'},
                            Intent: {type:'keyword'},
                            shortSummary: {type: 'text'},
                        }
                    }
                }
            }
        })

        console.log(`Index ${INDEX_NAME} created.`);
    }
};

export const indexEmail = async(email: any) => {
    await elasticClient.index({
        index: INDEX_NAME,
        document: email,
    })
}

export const searchEmails = async(query: string) => {
    try{
        //check if index exists and create if not
        const indexExists = await elasticClient.indices.exists({index: INDEX_NAME});
        if (!indexExists){
            console.log(`No index found. Creating index ${INDEX_NAME}...`);
            await createIndexIfNotExists();
            const emails = await listAndIndexEmails();
            console.log(`Indexed ${emails.length} emails for searching.`);
        }

        const result = await elasticClient.search({
        index: INDEX_NAME,
        query:{
            multi_match:{
                query,
                fields: ["from", "to", "subject", "snippet", "aiAnalysis.shortSummary"] //excluded body for now
            }
        }
    })

    return result.hits.hits.map((hit: any) => hit._source);

    } catch(error){
        console.error('Error searching emails:', error);
        throw error;
    }
};