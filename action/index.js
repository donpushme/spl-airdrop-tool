import { AxiosInstance, MemoryStoredToken } from "@/lib/utils";
import { encode } from "bs58";
import { API_URL } from "@/config";
import axios from "axios";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";

export const signIn = async (publicKey, wallet) => {
  let message = "";
  const walletAddress = publicKey.toBase58();
  try {
    const { data } = await axios.post(`${API_URL}/auth/signup`, {
      walletAddress,
    });
    if (!data.success) {
      const alert = {
        ...ErrorAlert,
        title: "Error",
        text: data.msg,
      };
      return { alert };
    }
    message = data?.message;
  } catch (error) {
    const alert = {
      ...ErrorAlert,
      title: "Error",
      text: error?.message || JSON.stringify(error),
    };
    return { alert };
  }

  const encodedMessage = new TextEncoder().encode(message);

  try {
    let signedMessage = await wallet.signMessage(encodedMessage, "utf8");
    signedMessage = encode(signedMessage);
    const { data } = await axios.post(`${API_URL}/auth/signin`, {
      walletAddress,
      signedMessage,
    });

    let alert = {};
    if (!data.success) {
      alert = {
        ...ErrorAlert,
        title: "Error",
        text: data.msg,
      };
    } else {
      window.localStorage.setItem("token", data?.token);
      console.log(data);
      alert = {
        ...SuccessAlert,
        title: "Welcome",
        text: "Successfully Singned",
      };
    }
    return { alert , isSigned:true };
  } catch (error) {
    console.log(error);
    const alert = {
      ...ErrorAlert,
      title: "Error",
      text: error?.message || JSON.stringify(error),
    };
    return { alert };
  }
};

export const testSign = async () => {
  const response = await AxiosInstance.request({
    method: "get",
    url: "/",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
  });
  console.log(response);
};
