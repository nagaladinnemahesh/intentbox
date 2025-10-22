import express from 'express'
import bodyParser from 'body-parser'
import { listEmails } from './gmailService.js'

const app = express()
app.use(bodyParser.json())

app.get('/emails', async(req,res) => {
    const emails = await listEmails();
    res.json(emails);
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

