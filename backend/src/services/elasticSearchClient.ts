import {Client} from "@elastic/elasticsearch";

const elasticClient = new Client({
    node: "http://localhost:9200"
})

export default elasticClient;