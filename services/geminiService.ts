import { GoogleGenAI, Type } from "@google/genai";
import { Article, Blog, ActivityResults } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ========== BLOG AGGREGATOR SERVICE ==========

const articleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { 
            type: Type.STRING,
            description: "A compelling, SEO-friendly title for the blog post."
        },
        summary: {
            type: Type.STRING,
            description: "A concise, engaging summary of the article content, around 2-3 sentences."
        },
        link: {
            type: Type.STRING,
            description: "A plausible, full URL for the article on the blog's website. Should look realistic."
        },
        date: {
            type: Type.STRING,
            description: "A plausible recent date for the article, in 'Month Day, Year' format (e.g., 'October 28, 2023')."
        },
    },
    required: ["title", "summary", "link", "date"],
};

const generateBlogResponseSchema = (blogs: Blog[]) => {
    const properties = blogs.reduce((acc, blog) => {
        acc[blog.name] = {
            type: Type.ARRAY,
            description: `An array of exactly 2 recent blog posts from ${blog.name} that are highly relevant to the user's keywords.`,
            items: articleSchema,
        };
        return acc;
    }, {} as Record<string, object>);

    return {
        type: Type.OBJECT,
        properties,
    };
};

export const fetchBlogArticles = async (blogs: Blog[], keywords: string): Promise<Record<string, Omit<Article, 'id'|'source'>[]>> => {
    const blogDescriptions = blogs.map(b => `- ${b.name}: ${b.description}`).join('\n');
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `
        You are a sophisticated blog scraping bot for Nashville, Tennessee.
        Your task is to find the two most recent and relevant articles, posts, or events from a specific list of Nashville blogs that match the user's keywords.
        The current date is ${currentDate}. All generated articles must have a plausible publication date within the last 7 days.

        User Keywords: "${keywords}"

        Target Blogs:
        ${blogDescriptions}

        Instructions:
        1. For EACH of the blogs listed above, generate exactly TWO plausible post summaries that are highly relevant to the user's keywords.
        2. The posts must sound like they were published within the last week.
        3. Create a realistic title, a concise summary, a plausible URL, and a recent date for each post (e.g., 'October 28, 2023'). The date MUST be within the last 7 days from today's date (${currentDate}).
        4. Your entire output must be a single JSON object that strictly adheres to the provided schema. Do not include any other text or explanations.
    `;

    const responseSchema = generateBlogResponseSchema(blogs);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (typeof parsedJson !== 'object' || parsedJson === null) {
            throw new Error("Invalid JSON response from API.");
        }

        return parsedJson;
    } catch (error) {
        console.error("Error fetching or parsing blog articles:", error);
        throw new Error("Failed to get a valid response from the Gemini API.");
    }
};


// ========== ACTIVITY FINDER SERVICE ==========

const activityResponseSchema = {
    type: Type.OBJECT,
    properties: {
        events: {
            type: Type.ARRAY,
            description: "A list of 3 fictional but highly plausible events from Eventbrite or Meetup.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The catchy title of the event." },
                    summary: { type: Type.STRING, description: "A short, engaging summary of the event." },
                    link: { type: Type.STRING, description: "A plausible URL for the event page." },
                    date: { type: Type.STRING, description: "A plausible date and time for the event." },
                    source: { type: Type.STRING, description: "The source platform, either 'Eventbrite' or 'Meetup'." }
                },
                required: ["title", "summary", "link", "date", "source"]
            }
        },
        redditPosts: {
            type: Type.ARRAY,
            description: "A list of 2 fictional but highly plausible Reddit posts from r/nashville.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the Reddit post." },
                    summary: { type: Type.STRING, description: "A brief summary of the post's content or top comment." },
                    link: { type: Type.STRING, description: "A plausible URL for the Reddit post." },
                    subreddit: { type: Type.STRING, description: "The subreddit, likely 'r/nashville'." },
                    author: { type: Type.STRING, description: "A plausible Reddit username for the author (e.g., u/username)." }
                },
                required: ["title", "summary", "link", "subreddit", "author"]
            }
        },
        googleAlerts: {
            type: Type.ARRAY,
            description: "A list of 2 fictional 'Google Alert' style results from obscure local blogs.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the article or blog post found." },
                    summary: { type: Type.STRING, description: "A snippet of text from the article." },
                    link: { type: Type.STRING, description: "A plausible URL for the article." },
                    source: { type: Type.STRING, description: "The name of the source website or blog." }
                },
                required: ["title", "summary", "link", "source"]
            }
        }
    },
    required: ["events", "redditPosts", "googleAlerts"]
};

export const fetchObscureActivities = async (keywords: string): Promise<ActivityResults> => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `
        You are a "digital sleuth" specializing in finding unique, obscure, and underground activities in Nashville, Tennessee.
        Your task is to generate a list of plausible-sounding events, Reddit discussions, and web findings based on user-provided keywords.
        The current date is ${currentDate}. Use this for context.

        User's Search Keywords: "${keywords}"
        Initial Seed Keywords to Inspire You: "Nashville pop-up", "secret show Nashville", "hidden Nashville", "underground", "secret", "weird"

        Instructions:
        1.  **Eventbrite & Meetup:** Generate a list of 3 fictional but highly plausible events. **Crucially, all events MUST take place in the future, within the next 30 days from today's date (${currentDate}).** They should sound like pop-ups, secret shows, or niche gatherings. Include a realistic title, a future date/time, a short engaging summary, a source (either 'Eventbrite' or 'Meetup'), and a plausible link.
        2.  **Reddit Scrape:** Generate a list of 2 fictional but highly plausible Reddit posts from r/nashville. These posts should be recent, appearing to be from the last month, discussing upcoming or recent unique activities. Include a catchy post title, a summary of the discussion, a plausible author username, and a link to the post.
        3.  **Google Alerts:** Generate a list of 2 fictional "Google Alert" style results from obscure blogs. These articles should be recently published, within the last month, announcing or discussing unique local happenings. Include a title, a brief snippet/summary, the source website name, and a link.

        Your entire output must be a single JSON object that strictly adheres to the provided schema. Do not include any other text or explanations.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: activityResponseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching or parsing obscure activities:", error);
        throw new Error("Failed to get a valid response from the Gemini API for activities.");
    }
};