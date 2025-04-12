# My Wedding Website Journey

This document captures my personal experience building a custom wedding website, including my motivations, technical choices, challenges, and learnings along the way. Consider this the "behind the scenes" look at how and why this project came to be.

## Background and Motivation

I am a software engineer by trade, so I have some experience with web and cloud development! I had about a year and a half between the engagement and the wedding, so I felt safe committing to building the wedding website myself, knowing I could always fall back to one of the more popular & free online site builders. I had some accountability for once on a personal project, but plenty of time and pretty low stakes (max 150 users maybe), so it was motivating but not overwhelming to get this done.

I don't have much experience standing up a website truly from scratch, so I wanted to take the chance to:

- Put a personal touch on an exciting event
- Show off a bit to my friends and family
- Try out some new technologies I've been interested in

The result is arguably a less-featured (read: shitty) version of The Knot, but it is a true "soup to nuts" custom build with what I think are some unique and cool customizations around configurability, and sets you up with a pretty solid starting-point custom wedding website. Plus, it should be completely free to host, assuming you don't have tens of thousands of friends/family/guests (I sure don't)! Cost-effectiveness and generous free tiers was a very strong factor in selecting these services/technologies.

## Tech Stack & Services

I usually use AWS for cloud/hosting services and javascript/node.js language, and Vue for web framework at work. I wanted to shake things up and try out SvelteKit web framework and Cloudflare for cloud service, which have both been on my list to try out. I have also been wanting to try out some AI helper coding tools to see how fast and to what level I could get a "polished" project completed.

Here are my opinions on the components of the tech stack; I want to make a disclaimer that I am by no means an expert, pro, or purist with front end development. For me, front end is largely a means to an end and I view it almost as a "necessary evil". Part of this is probably because I am a self-taught programmer so I didn't start off my programming career with the strongest grasp of UI development patterns, HTML, etc.; Part of it is because I am a bit of a perfectionist and often finding myself spending an hour adjusting the width and postioning of a textbox or something similar. If you are a UI dev you may have some very strong opinions on my blasphemous statements on web framework; feel free to let me know (nicely), I am always interested to learn more.

### Why SvelteKit?

I use angularJS (the old one) at work daily and it is a bit complicated. I understand why they made new ones, but it is pretty easy to add on to things and get some cool SPAs going once you get the hang of it. I have a problem where I end up with huge scope/controller files to get things done efficiently, and directives are really awkward and weird to create for something that is supposed to be reusable.

I also use Vue 3 at work daily and like it a lot (especially in comparison to angularJS). It is simple to read and I really like the logical compartmentalization the single file component offers, and it makes jumping in a lot easier because all your context is present in the same file. I like that it mostly still reads like HTML. It is so easy to make reusable UI components. The options API is a little weird though, and the Composition API is also a little weird in a differnt way, and some of the prop inheritance is a little weird. Most of it makes sense, but there are some clunky parts, probably because they serve some really powerful use case for scale or crazy apps, but for most of my use cases the benefits of these clunky parts are overkill for my use case and I try to work around them. Setting up routing can be weird, and backend logic & APIs have to be a separate setup/deploy project, so it can take some organization and discipline to keep things consistent and keep a holistic picture of the app when working with Vue.

I have recently gotten some experience with React and Next.js as well, and really like the simplicity of the file-based routing! It is great to have front end live right next to the backend in the code, and the file-based routing makes it really easy to chase down bugs. That being said, I am really just not a fan of React, a lot of it is not intuitive to me and feels awkward. I also am not a fan of the clunkiness/overhead of Next.js, it also feels very overkill for a lot of my use cases.

I did some research and Svelte/SvelteKit looked like a nice combo of the 2 that is super lightweight and gaining some traction recently, so would probably be a good framework to get some experience with. Plus, it has some direct integrations with Cloudflare that would make my life a bit easier deploying changes.

SvelteKit is awesome. I think it is the best of both worlds honestly, it reads SFC-style and HTML-like in the svelte files, but also has the benefits of the file-based routing. It is super lightweight and very quick to get going, but has enough functionality that every time I thought I was going to get blocked I found out a new feature to solve my problem. My only real complaint is it is kind of hard to flip back and forth between files in VSCode because all of the files have the same end path, but overall I am a fan and will definitely use again. I really liked that it worked pretty much out of box with cloudflare with very minimal configuration, and I would expect it to behave similarly for AWS/Azure/GCP as well.

### Why Cloudflare?

Cloudflare is traditionally more focused on web hosting, DNS, and CDN services. Recently, they have been heavily expanding their cloud offerings (especially in AI and cybersecurity). They also have probably the best free tier of any provider, and I wanted to get some experience with something other than AWS. I knew I could easily stay within free tier without much issue, and no egress fees for their S3 equivalent was pretty attractive for a wedding webiste, which usually has a lot of images.

I think Cloudflare is great! Their free tier alone makes it worth using, but they do have a pretty easy development experience on top of it. Despite no experience with Cloudflare or Sveltekit, I was able to get something I could get to in a browser in about an hour and a half, which is pretty impressive. The github integration is very nice, all I have to do is push to prod and it will automatically deploy. It was super easy to buy and set up a domain for the site.

That being said, I do think it has some limitations, and I don't think I would count it as a full "cloud provider" in the same breath as AWS, Azure, and GCP. In my opinion it would be pretty difficult to do a full SaaS, or even a web app with heavy business logic. They only have serverless functions for a backend offering, and only in javascript (not full Node.JS), and it looks like it is fairly coupled to their HTML/static hosting. Their extra services are fine and good! They offer a Workers KV, which is just a key-value store and does the job. It did take some getting used to since it is eventually consistent, so one has to be very careful around read-after-writes. I would prefer to use AWS DynamoDB. D1 is just SQLite, which is easy, simple, and fast, but huge volumes of data might start to cause issues. R2 is just S3, infinitely useful infinite storage which is even more dirt cheap on Cloudflare. I didn't use their queues service.

Cloudflare is really great for websites and most standard web apps though, wedding websites included, and I would definitely use again!

### Why Brevo?

I really wanted emails to send people a copy of their RSVP response! I have used Sendgrid in the past, but Sendgrid costs money. Brevo had the best free tier of API email services, it lets me send 300 emails per day without even needing a credit card. It was fast to set up and easy to verify my domain, it let me log into Cloudflare directly through their portal to apply the DNS records. It sends the email when I call the API, no complaints!

### Why Tailwind CSS?

Tailwind is super popular and I really only have a little experience with it. I am honestly lukewarm on it. It is easy for quick prototyping, but I have had trouble in the past with the inline CSS adjustments on large projects, it is very easy for things to become a beast of their own. I perfer regular CSS classes to keep things simple and uniform styling, it ends up being less typing and is easier to make a site "cohesive" in my opinion. I am still not great at either Tailwind or regular CSS.

## Claude, Cursor, and Other AI Help

I used AI help for this, including some code generation. It is somewhat controversial right now (at least at the time of this writing in April 2025), but it does speed me up a lot!

I used Claude's github integration in the regular chat web interface for the first half, and it is great. I also find that Claude is a good "sentient rubber duck" to bounce ideas off with (somewhat) collaboratively and to get a basic idea of what is "typical" best practice for architecture decisions. I use ChatGPT for quick hits and other day-to-day or one-offs, but really like Claude Projects.

I used Cursor for the first time for the second half of this project and really love it. I am a VSCode fan and feel in my element inside cursor, and love the direct apply to the file with the diff view. If you have not tried it and are a programmer, I recommend giving it a whirl, it feels very natural and easy to use.

I think this would have taken me at least 2 more months without AI help. I still had to design the features and functionality. I still wrote my own code. I still read the generated code, understand the generated code, and where it fits in the larger project. I often had to fix bugs in a lot of the generated code. But, honestly, it is pretty fun to code with AI. For me, where AI really shines is on UI, which is my least favorite, as I often have the vision in my head but takes ages to implement (Without AI). I am a builder at heart, and really enjoy seeing some concrete results, and AI is excellent at speeding up the 0 to 1 step and getting some visual outcomes for me before I lose interest or motivation. I have a lot to say on this and am happy to expand if you are interested or have differing opinions.

## Final Thoughts

I learned a lot from this project, got some experience with some new technologies, and found a lot of keepers for future projects. I also hope that maybe someone else can use this and get joy from this. You can use it for your own wedding to save some money and add a personal touch, use it as a starting point for your own personal project, or whatever else you want!
