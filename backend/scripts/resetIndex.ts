import elasticClient from "../src/elasticSearchClient.js";

const INDEX_NAME = "emails";

(async () => {
  try {
    const exists = await elasticClient.indices.exists({ index: INDEX_NAME });
    if (exists) {
      await elasticClient.indices.delete({ index: INDEX_NAME });
      console.log(`🧹 Deleted index: ${INDEX_NAME}`);
    } else {
      console.log(`ℹ️ Index ${INDEX_NAME} does not exist`);
    }
  } catch (err) {
    console.error("Error resetting index:", err);
  }
})();
