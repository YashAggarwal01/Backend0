import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, removeLocalFile } from "../utils/cloudnary.js"

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    // multer already saved the files, so clean them up if we reject the request
    const fail = (status, message) => {
        removeLocalFile(avatarLocalPath)
        removeLocalFile(coverImageLocalPath)
        throw new ApiError(status, message)
    }

    if ([fullname, email, username, password].some((f) => !f?.trim())) {
        fail(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    })
    if (existedUser) {
        fail(409, "User with this username or email already exists")
    }

    if (!avatarLocalPath) {
        fail(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered successfully"))
})

export { registerUser }
