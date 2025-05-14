import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

export const applyJob = async (req, res) => {
    try {

        const userId = req.id;
        const jobId = req.params.id;

        // console.log(jobId);


        if (!jobId) {
            return res.status(400).json({
                message: "JobId is reqired",
                status: false
            })
        };

        // check if the user has alredy apply for the job

        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job",
                status: false
            })
        }

        // check if the job exists

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(400).json({
                message: "Job does not exist",
                status: false
            })
        }

        // create a new application

        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        })

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Application created successfully",
            status: true
        })

    } catch (error) {
        console.log(error);

    }
}

// get applied jobs

export const getAppliedJobs = async (req, res) => {
    try {

        // console.log("userId");
        const userId = req.id;
        
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } }
            }
        })

        if (!application) {
            return res.status(404).json({
                message: "No application found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Applications found",
            application,
            success: true,
        })

    } catch (error) {
        console.log(error);
    }
}

//  admin dekega kitne user ne job me apply kiya hai 

export const getApplicants = async (req, res) => {
    try {

        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant',
                options: { sort: { createdAt: -1 } }
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }

        return res.status(200).json({
            job,
            success: true,
        });

    } catch (error) {
        console.log(error);

    }
}


// rejected or accepted 

export const updateStatus = async (req, res) => {
    try {
        // console.log("hello");
        
        const { status } = req.body;
        const applicationId = req.params.id;

        if (!status) {
            return res.status(400).json({
                message: "Status is required",
                success: false
            })
        }

        // find the application by application id

        const application = await Application.findOne({ _id: applicationId });

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                succes: false
            })
        }

        application.status = status.toLowerCase();

        await application.save();

        return res.status(200).json({
            message:"status updated successfully ",
            application,
            success: true,
        })


    } catch (error) {
        console.log(error);

    }
}