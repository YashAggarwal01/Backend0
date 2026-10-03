import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, removeLocalFile } from "../utils/cloudnary.js"




const generateAccessTokenAndRefreshToken =async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Something went wrong while generating access token")
    }
}


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


const loginUser = asyncHandler(async (req,res) =>{
//todos
/* req body->body
username or email
find the user
password chekc
if password mismatch
access and refresh token send to user if passsword match
send cookie
*/
    const {email,username,password} = req.body
    if(!username || !email){
        throw new ApiError(400,"Username or Email Required")
    }

    const user =await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await 
    generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).
    select('-password -refreshToken')
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("acessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,
                refreshToken
            },
            "User Logged in successfully"
        )
    )


})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out Successfully"))




})  


export { 
    registerUser,
    loginUser,
    logoutUser
 }
