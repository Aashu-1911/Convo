import {StreamChat} from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("❌ Stream API key and secret are required");
    process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

/**
 * Delete Stream users by their user IDs
 * @param {string[]} userIds - Array of user IDs to delete
 * @param {boolean} hardDelete - If true, permanently deletes users. If false, soft deletes
 */
export async function deleteStreamUsers(userIds, hardDelete = true) {
    try {
        await streamClient.deleteUsers(userIds, { hard_delete: hardDelete });
        console.log(`✅ Users deleted successfully: ${userIds.join(", ")}`);
        return { success: true, deletedUsers: userIds };
    } catch (error) {
        console.error("❌ Error deleting users:", error.message);
        throw error;
    }
}

// Run from command line: node src/db/deleteStreamUsers.js userId1 userId2 userId3
if (process.argv[1].endsWith('deleteStreamUsers.js')) {
    const userIds = process.argv.slice(2);
    
    if (userIds.length === 0) {
        console.log("Usage: node src/db/deleteStreamUsers.js <userId1> <userId2> ...");
        console.log("Example: node src/db/deleteStreamUsers.js 6950844d3994ac8a5b117496");
        process.exit(1);
    }
    
    deleteStreamUsers(userIds)
        .then(() => {
            console.log("✅ All users deleted successfully");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to delete users:", error.message);
            process.exit(1);
        });
}
