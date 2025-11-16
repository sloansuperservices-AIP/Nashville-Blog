
export interface Article {
    id: string;
    title: string;
    summary: string;
    link: string;
    date: string;
    source: string;
}

export interface Blog {
    name: string;
    description: string;
    url: string;
}

export interface Event {
    title: string;
    summary: string;
    link: string;
    date: string;
    source: 'Eventbrite' | 'Meetup' | string;
}

export interface RedditPost {
    title: string;
    summary: string;
    link: string;
    subreddit: string;
    author: string;
}

export interface GoogleAlert {
    title: string;
    summary: string;
    link: string;
    source: string;
}

export interface ActivityResults {
    events: Event[];
    redditPosts: RedditPost[];
    googleAlerts: GoogleAlert[];
}
