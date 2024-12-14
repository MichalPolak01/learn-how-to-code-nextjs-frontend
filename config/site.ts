export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "LearnHowToCode",
  description: "Make beautiful websites regardless of your design experience.",
  navUserItems: [
    {
      label: "Home",
      href: "/home",
      authRequired: true
    },
    {
      label: "Kursy",
      href: "/courses",
      authRequired: true
    },
    // {
    //   label: "Stwórz quiz",
    //   href: "/course-wizard",
    //   authRequired: true
    // },
    {
      label: "Statystyki",
      href: "/stats",
      authRequired: true
    }
  ],
  navTeacherItems: [
    {
      label: "Home",
      href: "/home",
      authRequired: true
    },
    {
      label: "Kursy",
      href: "/courses",
      authRequired: true
    },
    {
      label: "Stwórz kurs",
      href: "/course-wizard",
      authRequired: true
    },
    {
      label: "Statystyki",
      href: "/stats",
      authRequired: true
    }
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/home",
      authRequired: true
    },
    {
      label: "Quizy",
      href: "/quizzes",
      authRequired: true
    },
    {
      label: "Stwórz quiz",
      href: "/course-wizard",
      authRequired: true
    },
    {
      label: "Ustwaienia profilowe",
      href: "/profile",
      authRequired: true
    },
    {
      label: "Logowanie",
      href: "/login",
      authRequired: false
    },
    {
      label: "Rejestracja",
      href: "/register",
      authRequired: false
    },
    {
      label: "Logout",
      href: "/logout",
      authRequired: true
    }
  ],
  navMenuAuth: [
    {
      label: "Login",
      href: "/login"
    },
    {
      label: "Register",
      href: "/register"
    }
  ]
};
