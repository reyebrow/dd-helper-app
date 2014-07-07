# DoneDone Extra views

Our team at work recently migrated our issue tracking to [DoneDone](http://www.getdonedone.com/) and we really like it but there are a couple of views I really miss from the system we had before. 

1. A calendar view
2. Project Grouping: I find the donedone list really hard to parse visually because what I care about is Project and Tags. Both of these things have filters but I want to be able to see a big list that groups by project where I can assess my day.

## Getting started

This app is fairly easy to install and deploy to Heroku.

```
npm install
bower install
npm start
```

## Deploying to heroku

After reading [this](https://medium.com/@3runjo/how-to-deploy-a-grunt-project-on-heroku-c227cb1ddc56) I installed the [heroku buildpack for grunt compass](https://github.com/stephanmelzer/heroku-buildpack-nodejs-grunt-compass)

Also don't forget to set the UTF8 as a default:

```
heroku config:add LANG=en_US.UTF-8
```

## Features that could be implemented:

1. Drag to change date on Calendar view. This could really help us and our project managers get organized quickly. Rejigging ticket dates en-mass is a bit tedious in DoneDone right now. 
2. Tags. The API view I'm pulling from currently doesn't include tags but I'd really like to see them.