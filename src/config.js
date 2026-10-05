export const SITE = {
  name: "Masjid As Sunnah",
  org: "Sunnah Foundation Australia Limited",
  address: "132-136 Haldon St, Lakemba NSW 2195, Australia",
  addressShort: "132-136 Haldon St, Lakemba NSW 2195",
  phone: "+61 484 518 332",
  phoneHref: "tel:+61484518332",
  email: "info@masjidassunnah.com.au",
  emailHref: "mailto:info@masjidassunnah.com.au",
};

export const SOCIALS = {
  facebook: {
    name: "Facebook",
    url: "https://www.facebook.com/masjidassunnahlakemba/",
    videosUrl: "https://www.facebook.com/masjidassunnahlakemba/videos/",
    reelsUrl: "https://www.facebook.com/masjidassunnahlakemba/reels/",
    liveUrl: "https://www.facebook.com/masjidassunnahlakemba/live/",
  },
  instagram: {
    name: "Instagram",
    url: "https://www.instagram.com/masjid.as.sunnah/",
  },
  youtube: {
    name: "YouTube",
    url: "https://www.youtube.com/@MasjidAsSunnahLakemba",
    streamsUrl: "https://www.youtube.com/@MasjidAsSunnahLakemba/streams",
    channelId: "UCGKNfy9vB_5-_-fStOVCbQg",
  },
};

export const APPS = {
  appStore: "https://apps.apple.com/app/masjidbox-one/id6502348854",
  playStore: "https://play.google.com/store/apps/details?id=com.masjidbox.one",
};

export const PRAYER_WIDGET_ID = "4L3IZy8XcrOrmR2GseaQQ";
export const PRAYER_WIDGET_URL = "https://masjidbox.com/prayer-times/masjidassunnah";

export const MAPS = {
  masjid:
    "https://www.google.com/maps?q=Masjid+As-Sunnah,+132+Haldon+St,+Lakemba+NSW+2195&output=embed",
  parking:
    "https://www.google.com/maps?q=parking+near+132+Haldon+St,+Lakemba+NSW+2195&output=embed",
};

export const NAV = [
  { label: "Home", href: "#home", route: "/" },
  { label: "About Us", href: "#about", route: "/about" },
  { label: "Prayer Times", href: "#prayer", route: "/prayer" },
  { label: "Events", href: "/events", route: "/events" },
  {
    label: "Colleges",
    href: "#colleges",
    children: [
      { label: "Alfirdaus College", route: "/colleges" },
      { label: "Islamic College of Australia", route: "/icoa" },
    ],
  },
  {
    label: "Media",
    href: "#media",
    children: [
      { label: "YouTube Livestreams", url: SOCIALS.youtube.streamsUrl },
      { label: "Facebook Videos", url: SOCIALS.facebook.videosUrl },
      { label: "Instagram", url: SOCIALS.instagram.url },
    ],
  },
  { label: "Contact Us", href: "/contact", route: "/contact" },
  { label: "Donate", href: "/donate", route: "/donate", cta: true },
];

export const FACEBOOK_MEDIA = {
  videos: [
    { title: "Jumu'ah Khutbah", href: SOCIALS.facebook.videosUrl },
    { title: "Weekly Lecture", href: SOCIALS.facebook.videosUrl },
    { title: "Qur'an Recitation", href: SOCIALS.facebook.videosUrl },
  ],
  pictures: [
    { title: "Community Iftar", href: SOCIALS.instagram.url },
    { title: "Eid Celebrations", href: SOCIALS.instagram.url },
    { title: "Qur'an Classes", href: SOCIALS.instagram.url },
  ],
  reels: [
    { title: "Inside the Masjid", href: SOCIALS.facebook.reelsUrl },
    { title: "Brothers' Halaqah", href: SOCIALS.facebook.reelsUrl },
    { title: "Masjid Moments", href: SOCIALS.facebook.reelsUrl },
  ],
};
