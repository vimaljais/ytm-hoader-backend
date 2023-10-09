import User from "../models/UserModel";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import TokenModel from "../models/TokenModel";

export const configurePassport = (passport: any, oauthConfig: any) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: oauthConfig.google.clientID,
        clientSecret: oauthConfig.google.clientSecret,
        callbackURL: oauthConfig.google.callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the user already exists in the database
          let user = await User.findOne({ googleId: profile.id });

          const access_expires_in = 3599;
          // in sec
          const refresh_expires_at = Date.now() / 1000 + access_expires_in;

          if (!user) {
            // Create a new user if not found
            user = new User({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails![0]?.value,
              photos: profile.photos![0]?.value,
              json: profile._json,
              accessToken,
              refreshToken,
              oauth2: {
                expires_in: access_expires_in,
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: "Bearer",
                expires_at: refresh_expires_at,
                filepath: "oauth.json",
                scope: "https://www.googleapis.com/auth/youtube"
              }
            });
            await user.save();
          } else {
            // Update the existing user's data
            user.name = profile.displayName;
            user.email = profile.emails![0]?.value;
            user.photos = profile.photos![0]?.value;
            user.json = profile._json;
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            user.oauth2!.expires_in = access_expires_in;
            user.oauth2!.access_token = accessToken;
            user.oauth2!.refresh_token = refreshToken;
            user.oauth2!.expires_at = refresh_expires_at;
            await user.save();
          }
          console.log("User created or updated successfully: ", user.name, " ID: ", user.id);

          const payload = {
            id: user.id,
            name: user.name,
            googleId: user.googleId
          };

          const jwtAccess = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
          const jwtRefresh = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "30d" });

          const tokenDoc = new TokenModel({
            _userId: user._id,
            googleId: user.googleId,
            refreshToken: jwtRefresh
          });

          await tokenDoc.save();

          done(null, { userDoc: user, token: jwtAccess, refreshToken: jwtRefresh });
        } catch (error: any) {
          return done(error);
        }
      }
    )
  );
};
