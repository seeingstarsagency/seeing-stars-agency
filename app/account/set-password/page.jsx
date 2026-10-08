import { getLang } from "../../../lib/i18n";
import SetPasswordForm from "./Form";
import { browserConfig } from "../../../lib/env";

export default async function SetPassword() {
  const lang = await getLang();
  return <SetPasswordForm lang={lang} sb={browserConfig()} />;
}
