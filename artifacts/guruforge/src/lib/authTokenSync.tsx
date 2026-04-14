import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export function AuthTokenSync() {
  const { getAccessToken, authenticated } = usePrivy();

  useEffect(() => {
    if (authenticated) {
      setAuthTokenGetter(() => getAccessToken());
    } else {
      setAuthTokenGetter(null);
    }
    return () => {
      setAuthTokenGetter(null);
    };
  }, [authenticated, getAccessToken]);

  return null;
}
