import { Redirect } from "expo-router";
import { useAuth } from "../lib/auth-context";

export default function Index() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/login" />;
}
