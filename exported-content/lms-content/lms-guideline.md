---
title: LMS Guideline
---


## Git Repository

Make a clone of the [LMS content GitHub repository](https://github.com/CodeAcademyBerlin/content) (staff permission required.) Follow the following steps to implement your changes:

1. Run `git pull origin master` to make sure you have the most recent version of the master branch.
2. Make a new branch from the master branch.
3. Implement your changes! You can make as many commits to this branch as you need.
4. Publish your branch to GitHub.
5. When you are ready to implement your changes, make a pull request on GitHub.
6. If there are no conflicts, merge your branch.
7. Delete the branch from GitHub.
8. Delete the branch locally - first run `git checkout master` to return to the master branch. Then run `git branch -d "branch_name"`.
9. Run `git pull` from the master branch again to get all changes!
10. LMS changes need to still be deployed, inform Lucas or Emily that you have implemented changes that are ready to go live.

## General Guidelines

[Mastering Markdown](https://guides.github.com/features/mastering-markdown/)

## Meta Attributes

Three meta attributes are mandatory:

* `title` - H1 main title of the page
* `metaTitle` browser tab name (should be short)
* `access` access permissions: web | data | all | admin | public

Add navigation links to the bottom of the page with `next` and `prev` (must define full path)

```md
---
title: 'H1 title of the page'
metaTitle: 'the browser tab name and should be short'
access: web / data / all / admin / public
order: 30 (integer defining the order of lessons )
prev: path of prev page eg : web/Module-1/Project-1
next: path of next page eg : web/Module-1/Project-1/Sprint-1
---
```

## Static images

Images must be placed in the "assets" folder. MD images follow the format `![alt text](src path)`. The source path must contain the prefix "staticAsset", e.g.

```md
![TypeScript](staticAsset/web/TypeScript.jpg)
```

## Headers

* The main page title is an H1 and can be added to the meta attributes `title`.
* Section headers will be H2 and can be defined with `##`. All `##` are automatically added to the right "contents" quick navigation.

```md
## This is a section header
```

## Codeblocks

Use single backticks "\`" for inline code, e.g.

```md
This is an example of inline code: `<div>this is a div</div>`.
```

Use three backticks to generate a codeblock. Always specify the language when opening a code block (e.g. \`\`\`python)

## Videos

Use `<video />` tags to embed videos. Video files should be hosted on Google storage as GitHub limits the size of files to 100mb, give the link to the video as the `src`.

```html
<video
  src="https://storage.googleapis.com/lms-codeacademyberlin/spikes/TypeScript%20Part%201.mp4"
/>
```

## Iframe Integration

Use `<iframe />` elements to embed other online media, e.g. Google slides, YouTube videos, Trello, maps, calendars. Give the embed link as the `src` and set a `title`. Strict `height` and `width` properties can be set, or use the `style` property to add CSS aspect-ratio (16:9 for YouTube, 4:3 Google Slides) and width % to maintain proportions dynamically.

```text
<iframe 
  title="CAB-map" 
  style="aspect-ratio: 4/3; width: 90%"
  src="https://www.google.com/maps/..."
/>
```

\<iframe title="CAB-map" style="aspect-ratio: 4/3; width: 90%" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.365923758914!2d13.49136765534277!3d52.490615454927436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a84f446e0c53a1%3A0x27eac7eee50f967e!2sCode%20Academy%20Berlin!5e0!3m2!1sen!2sde!4v1607426515473!5m2!1sen!2sde"/>
