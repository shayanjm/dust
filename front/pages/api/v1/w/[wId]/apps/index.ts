import { NextApiRequest, NextApiResponse } from "next";

import { getApps } from "@app/lib/api/app";
import { Authenticator, getAPIKey } from "@app/lib/auth";
import { ReturnedAPIErrorType } from "@app/lib/error";
import { apiError, withLogging } from "@app/logger/withlogging";
import { AppType } from "@app/types/app";

export type GetAppsResponseBody = {
  apps: AppType[];
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAppsResponseBody | ReturnedAPIErrorType>
): Promise<void> {
  let keyRes = await getAPIKey(req);
  if (keyRes.isErr()) {
    return apiError(req, res, keyRes.error);
  }
  let { auth } = await Authenticator.fromKey(
    keyRes.value,
    req.query.wId as string
  );

  let apps = await getApps(auth);

  switch (req.method) {
    case "GET":
      res.status(200).json({ apps });
      return;

    default:
      return apiError(req, res, {
        status_code: 405,
        api_error: {
          type: "method_not_supported_error",
          message: "The method passed is not supported, GET is expected.",
        },
      });
  }
}

export default withLogging(handler);
