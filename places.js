'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {

	var params = {
        TableName: 'places',
    };

    dynamoDb.scan(params, (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    response: data.Items
                })
            });
        }

    });

} 

module.exports.getById = (event, context, callback) => { 

	var params = {
        TableName: 'places',
        Key: {
      		id: event.pathParameters.id,
    	}
    };

    console.log( 'PARAMS ID', event.pathParameters.id )

    dynamoDb.get( params, ( err, data ) => {
        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    response: data.Items
                })
            });
        }
    })
}

module.exports.create = (event, context, callback) => {
	const timestamp = new Date().getTime();
	const data = JSON.parse( event.body );

	// if (typeof data.text !== 'string') { 
	// 	console.error('Validation Failed') 
	// 	callback( new Error(`Couldn't create the todo item`))
	// 	return 
	// }

	const name = data.name 
	const address = data.address
	const latitude = data.latitude
	const longitude = data.longitude

	const params = {
		TableName: 'places',
		Item: { 
			id: uuid.v1(),
			name: name,
			address: address,
			latitude: latitude,
			longitude: longitude,
			createdAt: timestamp,
			updatedAt: timestamp
		}
	}

	dynamoDb.put( params, (error, result) => {
		console.log('DYNAMO RESULT:', result)
		console.log('DYNAMO ERROR:', error)

		if(error){
			console.log(error);
			callback( new Error(`Couldn't create place`));
			return;
		}

		const response = {
			statusCode : 200,
			body: JSON.stringify(result.Item)
		}
		callback( null, response);
	})


};


/*
Test Data
{
	name: 'Smothing  Must be a Places',
	address: 'Sample Address Here',
	latitude: 0.000002,
	longitude: 0.33333,
}

*/