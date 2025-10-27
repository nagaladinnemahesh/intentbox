import elasticClient from "./elasticSearchClient.js";

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
    const result = await elasticClient.search({
        index: INDEX_NAME,
        query:{
            multi_match:{
                query,
                fields: ["from", "to", "subject", "snippet"] //excluded body for now
            }
        }
    })

    return result.hits.hits.map((hit: any) => hit._source);
}