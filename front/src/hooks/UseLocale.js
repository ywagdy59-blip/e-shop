import { useContext } from "react";
import { LocaleContext } from "../Context/LocaleContext";
export const useLocale = () => { const locale = useContext(LocaleContext); if (!locale) throw new Error("useLocale must be used inside LocaleProvider"); return locale; };
