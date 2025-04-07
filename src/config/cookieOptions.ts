// export const setCookieOptions = {
//     httpOnly: true,
//     secure: false,
//     sameSite: 'strict' as const
// };

export const setCookieOptions = {
    httpOnly: true,
    secure: true, // Must be true in production for HTTPS
    sameSite: 'none' as const // Allows cross-site cookies
};
