import { AxiosInstance, MemoryStoredToken } from "@/lib/utils";
import bs58 from "bs58";
import { API_URL } from "@/config";
import axios from "axios";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";

export const signIn = async (wallet) => {
  let message = "";
  const walletAddress = wallet.publicKey.toBase58();
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
  let signedMessage = "";

  try {
    signedMessage = await wallet.signMessage(encodedMessage, "utf8");
    signedMessage = bs58.encode(signedMessage);
  } catch (error) {
    alert = {
      ...ErrorAlert,
      title: "User rejected",
      text: "Try again",
    };
    return { alert, isSigned: false };
  }

  try {
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
      alert = {
        ...SuccessAlert,
        title: "Welcome",
        text: "Successfully Singned",
      };
    }
    return { alert, isSigned: true };
  } catch (error) {
    const alert = {
      ...ErrorAlert,
      title: "Error",
      text: error?.message || JSON.stringify(error),
    };
    return { alert, isSigned: false };
  }
};

export const uploadChunk = async (chunk, uploadId, chunkIndex) => {
  const formData = new FormData();
  formData.set("file", chunk);
  try {
    await AxiosInstance.request({
      url: "/airdrop/upload-endpoint",
      method: "POST",
      data: formData,
      headers: {
        "X-Upload-Id": uploadId,
        "X-Chunk-Index": chunkIndex,
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const finalizeUpload = async (uploadId) => {
  const response = await AxiosInstance.request({
    url: "/airdrop/final-upload",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
    data: JSON.stringify({
      uploadId,
    }),
  });
  return response.data;
};

export const getList = async (fileId) => {
  try {
    const response = await AxiosInstance.request({
      url: "/airdrop/loadlist",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      data: {
        fileId,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const fetchPaginatedData = async (
  fileId,
  page,
) => {
  const perPage = 10000;
  const isBeginning = page == 1 ? true : false;
  try {
    const response = await AxiosInstance.request({
      url: "/airdrop/loadlist",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      data: {
        fileId,
        page,
        perPage,
        isBeginning,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const loadListbyChunks = async (fileId) => {
  let page = 1;
  let allData = [];
  let data;
  try {
    do {
      try {
        data = await fetchPaginatedData(fileId, page);
      } catch (error) {
        console.log(error);
      }
      data = data.paginatedData;
      allData = allData.concat(data);
      page++;
    } while (data.length > 0 && typeof data != "undefined");
  } catch (error) {
    console.log(error);
  }
  console.log("all data", allData);
  return allData;
};

export const airdrop = (fileId, tokenMint, wallet, amount) => {
  const data = { fileId, tokenMint, wallet, amount };
  const response = AxiosInstance.request({
    url: "/airdrop/transfer",
    method: "POST",
    data: data,
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
  if (response.success) return "sent";
};

export const proposeNFTSwap = async (address, nfts) => {
  const data = { address, nfts };
  const response = await AxiosInstance.request({
    url: "/nft-swap/propose",
    method: "POST",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
    data: data,
  });
  return response;
};

export const updateProposal = async (
  id,
  userId1,
  nft1,
  userId2,
  nft2,
  confirm
) => {
  const status = nft1.length > 0 && nft2.length > 0 ? 1 : 0;
  const data = { id, userId1, nft1, userId2, nft2, status, confirm };
  const response = await AxiosInstance.request({
    url: "/nft-swap/update",
    method: "POST",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
    data: data,
  });
};

export const getProposal = async (id) => {
  const url = id ? `/nft-swap/${id}` : "/nft-swap";
  const { data } = await AxiosInstance.request({
    url: url,
    method: "GET",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
  });

  if (data.success) return data.data;
  else return {};
};

export const updateConfirm = async (id, confirm) => {
  const data = { id, confirm };
  try {
    const response = await AxiosInstance.request({
      url: "/nft-swap/update-confirm",
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getConfirm = async (id) => {
  const data = { id };
  try {
    const response = await AxiosInstance.request({
      url: "/nft-swap/confirm",
      method: "POST",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      data: data,
    });
    if (response.data.success) return response.data.confirm;
  } catch (error) {
    console.log(error);
  }
};

export const deleteProposal = async (id) => {
  const url = `/nft-swap/${id}`;
  try {
    const response = await AxiosInstance.request({
      url: url,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const completeProposal = async (id) => {
  const url = `/nft-swap/${id}`;
  try {
    const response = await AxiosInstance.request({
      url: url,
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    if (response.data.success) return true;
  } catch (error) {
    console.log("error");
    return false;
  }
};

export const fetchFile = async (fileId) => {
  const url = `/airdrop/file/${fileId}`
  try {
    const { data } = await AxiosInstance.request({
      url: url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    if (data.success) return data.file;
    else return {}
  } catch (error) {
    console.log(error)
    return {}
  }
}


export const fetchUploadedFiles = async () => {
  const url = `/airdrop/upload-files`;
  try {
    const { data } = await AxiosInstance.request({
      url: url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
    });

    if (data.success && data.data.length) return data.data;
    else return []
  } catch (error) {
    console.log(error)
  }
}


export const uploadList = async (list) => {
  const chunkSize = 1000; // 1MB chunks
  const uploadId = Date.now().toString(); // Unique identifier for the upload session
  let start = 0;
  let chunkIndex = 0;

  try {
    while (start < list.length) {
      const chunk = list.slice(start, start + chunkSize);
      await uploadChunkList(chunk, uploadId, chunkIndex);
      start += chunkSize;
      chunkIndex++;
    }

    // Finalize the upload
    const {success} = await finalizeUploadList(uploadId);

    if (success) {
      return true
    } else {
      console.log(`Upload failed`);
      return false
    }
  } catch (error) {
    return false
  }
};

// Helper function for uploading a chunk
const uploadChunkList = async (chunk, uploadId, chunkIndex) => {

  const url = "/snapshot/upload-chunk"
  await AxiosInstance.request({
    url: url,
    method: "POST",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    },
    data: {
      chunk,
      uploadId,
      chunkIndex
    }
  });
};

// Helper function for finalizing the upload
const finalizeUploadList = async (uploadId) => {
  const {data} = await AxiosInstance.request({
    url: `/snapshot/finalize-upload/${uploadId}`, method: 'POST', headers: {
      Authorization: `Bearer ${window.localStorage.getItem("token")}`,
    }
  }
  )
  console.log({data})
  return {success:data.success};
};
