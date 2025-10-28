import elasticClient from "./elasticSearchClient.js";
import { listAndIndexEmails } from "./gmailService.js";
import { generateEmbedding } from "./services/embeddingService.js";

const INDEX_NAME = "emails";

export const createIndexIfNotExists = async () => {
  const indexExists = await elasticClient.indices.exists({
    index: INDEX_NAME,
  });
  if (!indexExists) {
    await elasticClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          from: { type: "text" },
          to: { type: "text" },
          subject: { type: "text" },
          date: { type: "date" },
          snippet: { type: "text" },
          body: { type: "text" },
          aiAnalysis: {
            properties: {
              Importance: { type: "keyword" },
              Intent: { type: "keyword" },
              shortSummary: { type: "text" },
            },
          },
          // vector embedding
          aiEmbedding: {
            type: "dense_vector",
            dims: 768,
            index: true,
            similarity: "cosine",
          },
        },
      },
    });

    console.log(`Index ${INDEX_NAME} created.`);
  }
};

// indexing email with embedding

export const indexEmail = async (email: any) => {
  try {
    const combinedText = `${email.subject || ""} ${email.snippet || ""} ${
      email.aiAnalysis.shortSummary || ""
    }`;
    const aiEmbedding = await generateEmbedding(combinedText);

    await elasticClient.index({
      index: INDEX_NAME,
      document: { ...email, aiEmbedding },
    });
  } catch (error) {
    console.error("Error indexing email:", error);
  }
};

// hybrid search function (keyword + vector)
export const searchEmails = async (query: string) => {
  try {
    //checking if index exists and create if not
    const indexExists = await elasticClient.indices.exists({
      index: INDEX_NAME,
    });
    if (!indexExists) {
      console.log(`No index found. Creating index ${INDEX_NAME}...`);
      await createIndexIfNotExists();
      const emails = await listAndIndexEmails();
      console.log(`Indexed ${emails.length} emails for searching.`);
    }

    const queryEmbedding = await generateEmbedding(query);

    // hybrid search query
    const result = await elasticClient.search({
      index: INDEX_NAME,
      _source: { excludes: ["aiEmbedding"] }, // exclude embedding from results
      size: 10,
      query: {
        bool: {
          should: [
            {
                multi_match: {
                  query,
                  fields: [
                    "from",
                    "to",
                    "subject",
                    "snippet",
                    "aiAnalysis.shortSummary",
                  ], //excluded body for now
                },
            },
            {
              knn: {
                field: "aiEmbedding",
                query_vector: queryEmbedding,
                k: 5,
                num_candidates: 100,
              },
            },
          ],
        },
      },
    });

    return result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: Math.round(hit._score * 100),
    }));
  } catch (error) {
    console.error("Error searching emails:", error);
    throw error;
  }
};
