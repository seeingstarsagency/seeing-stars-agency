import { browserConfig } from "../../../lib/env";
import Callback from "./Callback";

export const dynamic = "force-dynamic";

export default function Page() {
  return <Callback sb={browserConfig()} />;
}
