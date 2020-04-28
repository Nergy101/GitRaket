const shortid = require('shortid')
module.exports = {
    seedFriendsData(db) {
        db.defaults({
            collections: [],
            friends: []
        }).write()
        db.get('collections').remove().write()
        db.get('collections').push("friends").write()
        db.get('friends').remove().write()
        db.get('friends').push({
            "firstName": "Kris",
            "surName": "de Dyk",
            "emailAddress": "Kris-Dyk@test.com",
            "id": "8epKgUkq"
        }, {
            "firstName": "Pet",
            "surName": "da vee Lar",
            "emailAddress": "pet.de.vee.lar@test.com",
            "id": "vOgqytT-"
        }, {
            "firstName": "Testie",
            "surName": "von Tester",
            "emailAddress": "Test_von_Tester@test.com",
            "id": "VKPP9LUv"
        }).write();
    },
    deleteFriendsData(db) {
        db.get('friends').remove().write()
    },
    setDefaults(db) {
        db.defaults({
            friends: [],
        }).write()
    }
}