const express = require("express")
const bodyParser = require("body-parser")
const sanitize = require("./index")

const fakeDBCall = (query) => {
  return {success: true}
}

const patchedDbCall = sanitize(fakeDBCall)

const makeQuery = (rawQuery) => {
  return {abc:123}
}

const app = express()
app.use(bodyParser.json())

app.post("/", (req, res) => {
  const {query} = req.body
  const result = patchedDbCall(query)
  res.json(result)
})

app.post("/good", (req, res) => {
  const {query} = req.body
  const result = patchedDbCall(makeQuery(query))
  res.json(result)
})


app.listen(3002, () => console.log("Server listening on 3002"))
