const express = require('express')
const app = express()
app.use(express.json())
const low = require('lowdb')
const shortid = require('shortid')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
// const adapter = new FileSync('db.yaml', {
//     defaultValue: [],
//     serialize: (array) => toYamlString(array),
//     deserialize: (string) => fromYamlString(string)
//   })

// const adapter = new FileSync('db.json', {
//     serialize: (data) => encrypt(JSON.stringify(data)),
//     deserialize: (data) => JSON.parse(decrypt(data))
//   })
const db = low(adapter)
const database = require('./database')

database.setDefaults(db)
database.deleteFriendsData(db)
database.seedFriendsData(db)

app.get('/', async (_, res) => res.status(200).send(db.get('collections').value()))

app.get('/friends', async (req, res) => {
    if (req.query) {
        res.status(200).send(db.get('friends').map(req.query.field).value())
    } else {
        res.status(200).send(db.get('friends').value())
    }
})

app.get('/friends/top/:amount', async (req, res) => res.status(200).send(db.get('friends').sortBy('id').take(req.params.amount).value()))

app.get('/friends/query/:queryField/:queryValue', async (req, res) => {
    field = req.params.queryField
    value = req.params.queryValue
    res.status(200).send(db.get('friends').filter({
        field: value
    }).value())
})

app.get('/friends/:id', async (req, res) => {
    try {
        let friend = db.get('friends').find({
            'id': req.params.id
        }).value()

        if (!friend) {
            throw Error(`could not find friend with id: ${req.params.id}`)
        }

        res.status(200).send(friend)
    } catch (err) {
        res.status(404).send({
            'error': err.message
        })
    }
})

app.post('/friends', async (req, res) => {
    try {
        req.body.id = shortid.generate()
        db.get('friends').push(req.body).write()
        console.log(`inserted ${req.body.id}`)
        res.status(201).send(req.body)
    } catch (err) {
        res.status(401).send(err)
    }
})

app.put('/friends/:id', async (req, res) => {
    try {
        db.get('friends').find({
            id: req.params.id
        }).assign(req.body).write()
        console.log(`updated ${req.params.id}`)
        res.status(202).send(req.body)
    } catch (err) {
        res.status(401).end(err)
    }
})

app.delete('/friends/:id', async (req, res) => {
    try {
        db.get('friends').remove({
            id: req.params.id
        }).write()
        console.log(`deleted ${req.params.id}`)
        res.status(204).send({
            'result': 'succes'
        })
    } catch (err) {
        res.status(404).send(err)
    }
})

app.get('/:resource/:id', async (req, res) => {
    let resource = req.params.resource
    try {
        let obj = db.get(resource).find({
            'id': req.params.id
        }).value()

        if (!obj) {
            throw Error(`could not find object with id: ${req.params.id} in resource ${resource}`)
        }

        res.status(200).send(obj)
    } catch (err) {
        res.status(404).send({
            'error': err.message
        })
    }
})

app.get('/:resource', async (req, res) => {
    let resource = req.params.resource
    try {
        if (!db.has(resource).value()) {
            res.status(401).send({
                'error': `Resource '${resource}' does not exist or has no entries`
            })
        }
        res.status(200).send(db.get(resource).value())
    } catch (err) {
        res.status(401).send(err)
    }
})

app.post('/:resource', async (req, res) => {
    let resource = req.params.resource
    try {
        if (!db.has(resource).value()) {
            db.set(resource, []).write()
            db.get('collections').push("resource").write()
        }
        req.body.id = shortid.generate()
        db.get(resource).push(req.body).write()
        console.log(`inserted ${req.body.id} into ${resource}`)
        res.status(201).send(req.body)
    } catch (err) {
        res.status(401).send(err)
    }
})

app.put('/:resource/:id', async (req, res) => {
    let resource = req.params.resource
    try {
        db.get(resource).find({
            id: req.params.id
        }).assign(req.body).write()
        console.log(`updated ${req.params.id}`)
        res.status(202).send(req.body)
    } catch (err) {
        res.status(401).end(err)
    }
})

app.delete('/:resource/:id', async (req, res) => {
    let resource = req.params.resource
    try {
        db.get(resource).remove({
            id: req.params.id
        }).write()
        console.log(`deleted ${resource}: ${req.params.id}`)
        res.status(204).send({
            'result': 'succes'
        })
    } catch (err) {
        res.status(404).send(err)
    }
})

const port = 3200
app.listen(port, async () => console.log(`App listening on port ${port}...`))