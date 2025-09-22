import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, applyActionCode } from "firebase/auth";

const ActionHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const mode = query.get("mode");
    const oobCode = query.get("oobCode");

    if (!mode || !oobCode) {
      console.warn("ActionHandler: Missing mode or oobCode");
      return;
    }

    if (mode === "verifyEmail") {
      console.log("ActionHandler: Verifying email with oobCode:", oobCode);
      applyActionCode(auth, oobCode)
        .then(() => {
          console.log("ActionHandler: Email verification successful");
          navigate("/");
        })
        .catch((err) => {
          console.error("ActionHandler: Email verification failed", err);
        });
    } else if (mode === "resetPassword") {
      console.log(
        "ActionHandler: Redirecting to reset password with oobCode:",
        oobCode
      );
      navigate(`/reset-password?oobCode=${oobCode}`);
    } else {
      console.warn("ActionHandler: Unknown mode:", mode);
    }
  }, [location.search, navigate, auth]);

  return null;
};

export default ActionHandler;
