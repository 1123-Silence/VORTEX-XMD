const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { cmd } = require('../command');

const pluginsPath = path.join(__dirname, '../plugins');
const githubUrl = "https://raw.githubusercontent.com/DevHansTz1/Hans-Tz/refs/heads/main/HansTz.json"; // Change to your actual GitHub repo

let shuffledImages = [];
let imageIndex = 0;

// Function to fetch images from GitHub JSON
async function fetchImages() {
    try {
        let response = await axios.get(githubUrl);
        if (response.data && Array.isArray(response.data.images)) {
            shuffledImages = response.data.images.sort(() => Math.random() - 0.5); // Shuffle images
            imageIndex = 0;
        } else {
            console.log("⚠ Invalid JSON format: Missing 'images' array.");
        }
    } catch (error) {
        console.log("⚠ Failed to fetch images from GitHub:", error.message);
    }
}

// Get next image from the shuffled list
async function getNextImage() {
    if (shuffledImages.length === 0) {
        await fetchImages();
    }
    let image = shuffledImages[imageIndex];
    imageIndex++;

    if (imageIndex >= shuffledImages.length) {
        shuffledImages = shuffledImages.sort(() => Math.random() - 0.5); // Shuffle again
        imageIndex = 0;
    }
    return image;
}

// Command to list all available commands
cmd({
    pattern: "list2",
    alias: ["listcmd", "commands"],
    desc: "Show all available commands",
    category: "menu",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        let files = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));

        if (files.length === 0) {
            return reply("⚠ No command files found.");
        }

        let commandGroups = {};

        // Read each file and extract both `pattern` and `category` from all types of matches
        files.forEach(file => {
            let content = fs.readFileSync(path.join(pluginsPath, file), 'utf-8');
            let patternMatch = content.match(/(?:pattern|\'pattern\'):\s*["']([^"']+)["']/);  // Match both `pattern: ""` and `'pattern': ""`
            let categoryMatch = content.match(/(?:category|\'category\'):\s*["']([^"']+)["']/);  // Match both `category: ""` and `'category': ""`

            if (patternMatch && categoryMatch) {
                let command = patternMatch[1];
                let category = categoryMatch[1];

                // Include all patterns and categories without restrictions
                if (!commandGroups[category]) {
                    commandGroups[category] = [];
                }
                commandGroups[category].push(command);
            }
        });

        if (Object.keys(commandGroups).length === 0) {
            return reply("⚠ No valid commands found.");
        }

        // Build the message in your preferred format
        let commandList = '';

        for (let category in commandGroups) {
            commandList += `╭━━〔 *${category}* 〕━┈⊷\n`;
            commandList += `┃◈╭────────────·๏\n`;

            commandGroups[category].forEach(cmd => {
                commandList += `┃◈┃• ${cmd}\n`;
            });

            commandList += `┃◈└───────────┈⊷\n`;
            commandList += `╰─────────────┈⊷\n\n`;
        }

        // Get next image from GitHub JSON
        let imageUrl = await getNextImage();

        // Send the message with a random image
        await conn.sendMessage(
            from,
            {
                image: { url: imageUrl },
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363395768630577@newsletter', // Connected the newsletterJid
                        newsletterName: '💫 Vᴏʀᴛᴇx xᴍᴅ 💫',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: mek }
        );

        // Send the song after listing commands
        await conn.sendMessage(
            from,
            {
                audio: { url: 'https://github.com/devhanstz/VORTEX-XMD-DATA/raw/refs/heads/main/KingHans/Menu.mp3' },
                mimetype: 'audio/mp4',
                ptt: true
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
