const {
  Stitch,
  RemoteMongoClient,
  AnonymousCredential
} = require('mongodb-stitch-browser-sdk');

const client = Stitch.initializeDefaultAppClient('cubetest-qwuzj');

const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('cubetest');


export const loadEvents = function (params = {}) {


  return new Promise(function (resolve, reject) {

    client.auth.loginWithCredential(new AnonymousCredential()).then(user =>
      db.collection('events').aggregate([

        {
          "$addFields": {
            "true_date": {
              "$toDate": "$date"
            }
          }
        },
        {
          "$sort": {
            "true_date": -1
          }
        },
        {
          "$match": params.match
        },
        {
          "$skip": params.skip
        },
        {
          "$limit": 6
        }
      ]).asArray()
    ).then(docs => {

      resolve(docs);

    }).catch(err => {

      reject(Error("SUM TING WONG!"));

    });

  });


}


