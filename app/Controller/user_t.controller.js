import bcrypt from "bcrypt";
import prisma from "../DB/db.config.js";
import { addHours, format, getHours, isBefore, subHours } from "date-fns";
import { createToken } from "../lib/utils.lib.js";

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });

    const userExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist)
      return res.status(400).json({
        success: false,
        message: "User already exist can not register",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    if (newUser)
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: newUser.email,
        },
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "All details are required",
      });

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user)
      return res.status(409).json({
        success: false,
        message: "User does not exist plese register",
      });

      if (user.Locked && isBefore(new Date(), user.Locked)) {
        const lockuntil = format(user.Locked, "yyyy-MM-dd HH:mm:ss");
        return res.status(423).json({
          success: false,
          message: `Account Locked. Try again after ${lockuntil}`,
        });
      }
       
    // const lockuntil = format(user.Locked, "yyyy-MM-dd HH:mm:ss");

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      const now = new Date();

      await prisma.fail.create({
        data: {
          userId: user.id,
          lastLogin: now,
        },
      });
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          lastLogin: now,
        },
      });

      const twelveHoursAgo = subHours(now, 12);

      const youfailed = await prisma.fail.count({
        where: {
          userId: user.id,
          lastLogin: {
            gte: twelveHoursAgo,
          },
        },
      });

      console.log(youfailed);

      if (youfailed >= 5) {
        const lockedTime = addHours(now, 24);

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            Locked: lockedTime,
          },
        });

        await prisma.fail.deleteMany({
          where: {
            userId: user.id,
          },
        });

        return res.status(423).json({
          success: false,
          message: `Account Locked. Try again after ${format(
            lockedTime,
            "yyyy-MM-dd HH:mm:ss"
          )}`,
        });
      }

      return res.status(401).json({ message: "Invalid credentials" });
    }

    createToken(user, res);

    return res.status(200).json({
      success: true,
      message: "User Logged in succesfully",
      data: {
        user: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const homePage = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      message: `Hey! Welcome to the home page ${user.email}`,
      userDetails: {
        user: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).json({
      success: true,
      message: "Log out succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
