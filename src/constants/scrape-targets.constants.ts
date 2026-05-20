export type ScrapeTargetType = "static" | "dynamic";

export interface ScrapeTarget {
  name: string;
  url: string;
  type: ScrapeTargetType;
}

export const SCRAPE_TARGETS: ScrapeTarget[] = [
  {
    name: "We Work Remotely",
    url: "https://weworkremotely.com/remote-jobs",
    type: "static",
  },
  {
    name: "Remote OK",
    url: "https://remoteok.com",
    type: "static",
  },
];
