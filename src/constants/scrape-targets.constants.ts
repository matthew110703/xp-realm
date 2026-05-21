export interface ScrapeTargetSelectors {
  container: string;
  title: string;
  company: string;
  location: string;
  link: string;
  linkPrefix: string;
}

export interface ScrapeTarget {
  name: string;
  url: string;
  type: "static" | "dynamic";
  bestEffort?: boolean;
  selectors: ScrapeTargetSelectors;
}

export const SCRAPE_TARGETS: ScrapeTarget[] = [
  {
    name: "We Work Remotely",
    url: "https://weworkremotely.com/remote-jobs",
    type: "static",
    selectors: {
      container: "section.jobs article",
      title: "span.title",
      company: "span.company",
      location: "span.region",
      link: "a",
      linkPrefix: "https://weworkremotely.com",
    },
  },
  {
    name: "Remote OK",
    url: "https://remoteok.com/remote-jobs",
    type: "static",
    selectors: {
      container: "tr.job",
      title: "h2[itemprop='title']",
      company: "h3[itemprop='name']",
      location: "div.location",
      link: "a.preventLink",
      linkPrefix: "https://remoteok.com",
    },
  },
  {
    name: "Himalayas",
    url: "https://himalayas.app/jobs",
    type: "static",
    selectors: {
      container: "li.job-card",
      title: "h3.job-title",
      company: "p.company-name",
      location: "span.location",
      link: "a.job-link",
      linkPrefix: "https://himalayas.app",
    },
  },
  {
    name: "Working Nomads",
    url: "https://www.workingnomads.com/jobs",
    type: "static",
    selectors: {
      container: "div.job-item",
      title: "h4.job-title a",
      company: "span.company",
      location: "span.location",
      link: "h4.job-title a",
      linkPrefix: "",
    },
  },
  {
    name: "Remote.co",
    url: "https://remote.co/remote-jobs/",
    type: "static",
    selectors: {
      container: "li.job_listing",
      title: "h3.job-title",
      company: "span.company",
      location: "div.location",
      link: "a.listing",
      linkPrefix: "https://remote.co",
    },
  },
  {
    name: "Jobspresso",
    url: "https://jobspresso.co/remote-work/",
    type: "static",
    selectors: {
      container: "li.job_listing",
      title: "h3.job-title",
      company: "div.company span",
      location: "li.location",
      link: "a",
      linkPrefix: "",
    },
  },
  {
    name: "Nodesk",
    url: "https://nodesk.co/remote-jobs/",
    type: "static",
    selectors: {
      container: "article.card",
      title: "h2.card-title",
      company: "p.company",
      location: "span.location",
      link: "a.card-link",
      linkPrefix: "https://nodesk.co",
    },
  },
  {
    name: "Dynamite Jobs",
    url: "https://dynamitejobs.com/remote-jobs",
    type: "static",
    selectors: {
      container: "div.job-card",
      title: "h3.job-title",
      company: "span.company-name",
      location: "span.job-location",
      link: "a.job-card-link",
      linkPrefix: "https://dynamitejobs.com",
    },
  },
  {
    name: "JustRemote",
    url: "https://justremote.co/remote-jobs",
    type: "static",
    selectors: {
      container: "div.remote-job",
      title: "h2.job-title",
      company: "span.company",
      location: "span.location",
      link: "a.job-url",
      linkPrefix: "",
    },
  },
  {
    name: "Pangian",
    url: "https://pangian.com/job-travel-remote/",
    type: "static",
    selectors: {
      container: "div.job-box",
      title: "h3.job-title",
      company: "span.company-name",
      location: "span.job-location",
      link: "a.job-link",
      linkPrefix: "https://pangian.com",
    },
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/jobs/search/?keywords=remote+freelance&f_WT=2&f_JT=PT,C,T",
    type: "static",
    bestEffort: true,
    selectors: {
      container: "div.base-card",
      title: "h3.base-search-card__title",
      company: "h4.base-search-card__subtitle",
      location: "span.job-search-card__location",
      link: "a.base-card__full-link",
      linkPrefix: "",
    },
  },
];
