import API from "./api";

export const loginGoogle = async (
  accessToken
) => {

  const res = await API.post(
    "/auth/google",
    {
      access_token:
        accessToken,
    }
  );

  return res.data;
};