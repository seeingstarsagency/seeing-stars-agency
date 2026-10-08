import { getLang } from "../../../lib/i18n";
import SetPasswordForm from "./Form";

export default async function SetPassword() {
  const lang = await getLang();
  return <SetPasswordForm lang={lang} />;
}
