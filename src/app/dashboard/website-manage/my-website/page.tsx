
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function MyWebsitePage() {
    const [siteUrl, setSiteUrl] = useState('');

    useEffect(() => {
        // Construct the URL for the main website, assuming it runs on a different port or domain.
        // For this demo, we'll assume it's the same origin.
        setSiteUrl(window.location.origin);
    }, []);

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle>My Website Preview</CardTitle>
                    <CardDescription>This is a live preview of your public website homepage.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    {siteUrl ? (
                        <iframe
                            src={siteUrl}
                            className="w-full h-full border rounded-md"
                            title="Website Preview"
                        />
                    ) : (
                        <div className="w-full h-full border rounded-md flex items-center justify-center bg-muted">
                            <p>Loading preview...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
