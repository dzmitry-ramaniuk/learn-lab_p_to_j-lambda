import {CognitoIdentityProviderClient, AdminCreateUserCommand} from "@aws-sdk/client-cognito-identity-provider";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {v7 as uuid} from "uuid";


const cognitoClient = new CognitoIdentityProviderClient();
const dynamoDBClient = new DynamoDBClient();

export const handler = async (event) => {
    const {username, password, email, mobilePhone} = JSON.parse(event.body);

    const cognitoParams = {
        UserPoolId: 'lab_crypto', Username: username, UserAttributes: [{
            Name: 'email', Value: email,
        }], Password: password,
    }

    const dynamoParams = {
        TableName: 'UserInformation', Item: {
            UserID: uuid(),
            Username: username,
            Email: email,
            MobilePhone: mobilePhone,
            RegistrationDate: new Date().toISOString()
        }
    }

    try {
        const createUserCommand = new AdminCreateUserCommand(cognitoParams);
        const data = await cognitoClient.send(createUserCommand);

        const putItemCommand = new PutItemCommand(dynamoParams);
        await dynamoDBClient.send(putItemCommand);


        return {
            statusCode: 200, body: JSON.stringify({message: "User created successfullly", data})
        };
    } catch (error) {
        return {
            statusCode: 500, body: JSON.stringify({message: 'Error creating user', error})
        };
    }
};