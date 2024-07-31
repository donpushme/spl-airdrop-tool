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
    return { alert, isSigned: true };
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

export const uploadChunk = async (chunk, uploadId, chunkIndex) => {
  const formData = new FormData();
  formData.set("file", chunk);
  console.log(formData);
  try {
    await AxiosInstance.request({
      url: "/airdrop/upload-endpoint",
      method: "POST",
      data: formData,
      headers: {
        "X-Upload-Id": uploadId,
        "X-Chunk-Index": chunkIndex,
      },
    });
  } catch (error) {
    console.log;
  }
};

export const finalizeUpload = async (uploadId, fileType) => {
  const response = await AxiosInstance.request({
    url: "/airdrop/final-upload",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      uploadId,
      fileType,
    }),
  });
  return response.data;
};

export const getList = async (fileName, fileType) => {
  try {
    const response = await AxiosInstance.request({
      url: "/airdrop/loadlist",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        fileName,
        fileType,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchPaginatedData = async (
  fileName,
  fileType,
  page = 1,
  perPage = 10000
) => {
  try {
    const response = await AxiosInstance.request({
      url: "/airdrop/loadlist",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        fileName,
        fileType,
        page,
        perPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const loadListbyChunks = async (fileName, fileType) => {
  let page = 1;
  let allData = [];
  let data;
  try {
    do {
      data = await fetchPaginatedData(fileName, fileType, page);
      data = data.paginatedData;
      allData = allData.concat(data);
      page++;
    } while (data.length > 0);
  } catch (error) {
    console.log(error);
  }
  return allData;
};

export const airdrop = (fileName, fileType, tokenMint, wallet, amount) => {
  const data = { fileName, fileType, tokenMint, wallet, amount };
  const response = AxiosInstance.request({
    url: "/airdrop/transfer",
    method: "POST",
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.success) return "sent"
};


export const proposeNFTSwap = async (address, nfts) => {
  const data = {address, nfts}
  const response = await AxiosInstance.request({
    url: "/nft-swap/propose",
    method: "POST",
    headers : {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
    data: data
  })
  console.log(response)
} 

export const updateProposal = async (id, userId1, nft1, userId2, nft2, status) => {
  const data = {id, userId1, nft1, userId2, nft2, status}
  const response = await AxiosInstance.request({
    url: "/nft-swap/update",
    method: "POST",
    headers : {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
    data: data
  })
  console.log(response)
} 

export const getProposal = async (id) => {
  const url = id ? `/nft-swap/${id}` : "/nft-swap"
  const {data} = await AxiosInstance.request({
    url: url,
    method: "GET",
    headers : {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
  })
  
  if(data.success) return data.data
  else return {}
}