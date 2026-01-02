import { generateStreamToken } from "../db/stream.js";
import { StreamChat } from "stream-chat";

const streamClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY, 
    process.env.STREAM_API_SECRET
);

export async function getStreamToken(req, res) {
    try {
        const token = generateStreamToken(req.user.id);
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error generating stream token:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

export async function createChannel(req, res) {
    try {
        const { userId } = req.body;
        const currentUserId = req.user.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Create a unique channel ID for 1-on-1 chat
        const members = [currentUserId, userId].sort();
        const channelId = `messaging-${members.join('-')}`;

        // Create or get channel
        const channel = streamClient.channel('messaging', channelId, {
            members: members,
            created_by_id: currentUserId,
        });

        await channel.create();

        res.status(200).json({ 
            channelId: channel.id,
            channel: channel.data 
        });
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}