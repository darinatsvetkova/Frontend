import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      cs: {
        translation: {
          "My shopping lists": "Moje nákupní seznamy",
          "Create new list": "Vytvořit nový seznam",
          "Show archived lists": "Zobrazit archivované seznamy",
          "Show active lists": "Zobrazit aktivní seznamy",
          "Open": "Otevřít",
          "Archive": "Archivovat",
          "Delete": "Smazat",
          "Lists overview": "Přehled seznamů",
          "Members": "Členové",
          "Manage": "Spravovat",
          "Show completed items": "Zobrazit hotové položky",
          "Items status": "Stav položek",
          "Back to lists": "Zpět na seznamy",
          "Owner": "Vlastník"
        }
      },
      en: {
        translation: {
          "My shopping lists": "My shopping lists",
          "Create new list": "Create new list",
          "Show archived lists": "Show archived lists",
          "Show active lists": "Show active lists",
          "Open": "Open",
          "Archive": "Archive",
          "Delete": "Delete",
          "Lists overview": "Lists overview",
          "Members": "Members",
          "Manage": "Manage",
          "Show completed items": "Show completed items",
          "Items status": "Items status",
          "Back to lists": "Back to lists"
        }
      }
    },
    lng: "cs",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
