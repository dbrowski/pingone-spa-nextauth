"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";

// North America PingOne Auth API
const authAPI = "https://auth.pingone.com/";
const authorizeEndpoint = "/as/authorize";
const tokenEndpoint = "/as/token";

const envID = "333d66b5-d2f0-48d0-8ec0-cf4cafd35d25";
const clientID = "7cbbc92e-97d7-4f72-97e8-28173f76b8ba";
const redirectURI = "http://localhost:3000"; // Change if not running locally or port has been changed
const scopes = "openid";
const responseType = "code";
const grantType = "authorization_code";
const contentType = "application/x-www-form-urlencoded";

type TokenResponse = {
  access_token: string;
  id_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export const Home = () => {
  const [aT, setAT] = useState("");
  const [idT, setIDT] = useState("");

  const authzURL =
    authAPI +
    envID +
    authorizeEndpoint +
    "?" +
    "client_id=" +
    clientID +
    "&" +
    "redirect_uri=" +
    encodeURIComponent(redirectURI) +
    "&" +
    "scope=" +
    scopes +
    "&" +
    "response_type=" +
    responseType;

  const tokenURL = authAPI + envID + tokenEndpoint;

  useEffect(() => {
    const getTokens = async (
      authzCode: string
    ): Promise<TokenResponse | undefined> => {
      if (!authzCode) {
        throw new Error("Missing authorization code.");
      }

      const bod = new URLSearchParams();
      bod.append("client_id", clientID);
      bod.append("redirect_uri", redirectURI);
      bod.append("grant_type", grantType);
      bod.append("code", authzCode);

      const headers = new Headers();
      headers.append("Content-Type", contentType);

      try {
        const response = await fetch(tokenURL, {
          method: "POST",
          headers: {
            "Content-Type": contentType,
          },
          body: bod,
        });

        const json = await response.json();

        const res = json ? (json as TokenResponse) : null;
        const accessToken = res?.access_token;
        const idToken = res?.id_token;

        if (!res) {
          throw new Error(
            "No access token.\nresponse:\n" + JSON.stringify(json)
          );
        }

        if (accessToken) {
          // console.log("access token: " + accessToken);

          setAT(accessToken);
        }

        if (idToken) {
          // console.log("\nid token: " + idToken);

          setIDT(idToken);
        }

        return res;
      } catch (e) {
        const errorMsg = "failed to fetch tokens";
        console.error(errorMsg);
        console.error(e);
        throw new Error(errorMsg, { cause: e });
      }
    };

    const referred = document.referrer;

    const urlStr = document.URL;
    const url = new URL(urlStr);
    const queryParams = url.searchParams;

    if (referred && !queryParams.get("code")) {
      const url = new URL(referred);
      const queryParams = url.searchParams;
      const authzCode = queryParams?.get("code");

      if (authzCode) {
        try {
          getTokens(authzCode);
        } catch (error) {
          console.error(error);
          throw new Error("Problem getting token(s)", { cause: error });
        }
      }
    }
  });

  useEffect(() => {
    const urlStr = document.URL;
    const url = new URL(urlStr);
    const queryParams = url.searchParams;

    if (queryParams) {
      const authzCode = queryParams.get("code");

      if (authzCode) {
        try {
          url.search = "";
          window.location.replace(url);
        } catch (error) {
          console.error(error);
          throw new Error("Problem getting token(s)", { cause: error });
        }
      }
    }
  });

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>Get started with PingOne and NextJS</p>
        <div>
          <div style={{ paddingBottom: "1vh" }}>By</div>
          <a
            href="https://apidocs.pingidentity.com/pingone/main/v1/api/#getting-started-with-the-pingone-apis"
            target="_blank"
            rel="noopener noreferrer">
            <Image
              src="/Ping-Logo.svg"
              alt="Ping Identity Logo"
              className={styles.pingLogo}
              width={100}
              height={100}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/PingOne.svg"
          alt="PingOne Logo"
          width={620}
          height={112}
          priority
        />
      </div>

      <div
        style={{
          borderColor: "white",
          borderStyle: "solid",
          borderWidth: 3,
          padding: ".5rem",
        }}>
        <a
          href={authzURL}
          target="_self">
          <h1>Login</h1>
        </a>
      </div>

      <div
        style={{
          height: "10rem",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}>
        {aT ? (
          <p
            style={{
              fontSize: "0.75rem",
              wordBreak: "break-all",
              height: "100%",
              overflow: "auto",
            }}>
            access token: <br />
            {aT}
          </p>
        ) : (
          <></>
        )}
      </div>

      <div
        style={{
          height: "10rem",
          marginTop: "1rem",
          marginBottom: "2rem",
          fontSize: ".75rem",
        }}>
        {idT ? (
          <p
            style={{
              fontSize: "0.75rem",
              wordBreak: "break-all",
              height: "100%",
              overflow: "auto",
            }}>
            id token: <br />
            {idT}
          </p>
        ) : (
          <p>
            Click on <strong>Login</strong> to retrieve tokens
          </p>
        )}
      </div>
    </main>
  );
};

export default Home;
