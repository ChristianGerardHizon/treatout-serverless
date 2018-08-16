'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = (event, context, callback) => {

  AWS.config.update({
    region: 'ap-southeast-1'
  });

	var params = {
        TableName: 'places',
    };

    dynamoDb.scan(params, (err, data) => {

        if (err) {
    		console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
		    callback(err)
        } else {
        	const count = data.Items.length ? data.Items.length : 0
            const response = JSON.stringify({
                response: (count) ? data.Items : [],
                count: count
            })
            return callback(null, {
                statusCode: 200,
                headers: {
			      'Access-Control-Allow-Origin': '*',
			    },
                body: response 
            });
        }

    });

} 

module.exports.get = (event, context, callback) => { 

	 AWS.config.update({
		region: 'ap-southeast-1'
	});


	let response = {
	    statusCode: 200,
	    headers: {
	      'Access-Control-Allow-Origin': '*',
	    }
	};
	const id = (event.pathParameters.id) ? event.pathParameters.id : false

    if( !id ){
		callback( new Error(`Couldn't create place`));
		return;
    } 

	try{

		var params = {
	        TableName: 'places',
	        Key: {
	      		id: id,
	    	}
	    };

	    console.log( 'PARAMS ID', event.pathParameters.id )

	    dynamoDb.get( params, ( err, data ) => {
	    	console.log( 'RESULT', data )
	        if (err) {
	            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
	            callback(err);
	        } else {
	            console.log("Scan succeeded.");
	            return callback(null, {
	                statusCode: 200,
	                headers: {
				      'Access-Control-Allow-Origin': '*',
				    },
	                body: JSON.stringify({
	                    response: data.Item
	                })
	            });
	        }
	    })
	}catch( e ) {
		console.log('Error' , e);
	  	response.body = JSON.stringify({
	        error: {
	          code: '03',
	          message: 'Server error'
	        }
	      });
	  	callback(null, response);
	}
}

module.exports.create = (event, context, callback) => {

	AWS.config.update({
		region: 'ap-southeast-1'
	});

	try{

		const timestamp = new Date().getTime();
		const data = JSON.parse( event.body );

		const name = data['name']
		const address = data['address']
		const latitude = data['latitude']
		const longitude = data['longitude']

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
				headers: {
			      'Access-Control-Allow-Origin': '*',
			    },
				body: JSON.stringify(result.Item)
			}
			callback( null, response);
		});

	}catch(e){
		callback( new Error(e))
	}
};

