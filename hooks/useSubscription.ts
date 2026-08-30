'use client';

import { useUser } from "@clerk/nextjs";
import { PLANS, PLAN_LIMITS, PlanType } from "@/lib/subscription-constants";

export const useSubscription = () => {
    const { user, isLoaded: isUserLoaded } = useUser();

    if (!isUserLoaded) {
        return {
            plan: PLANS.FREE,
            limits: PLAN_LIMITS[PLANS.FREE],
            isLoaded: false,
        };
    }

    let plan: PlanType = PLANS.FREE;

    const metadataPlan = (
        user?.publicMetadata?.plan ||
        user?.publicMetadata?.billingPlan
    )
        ?.toString()
        .toLowerCase();

    if (metadataPlan === "pro") {
        plan = PLANS.PRO;
    } else if (metadataPlan === "standard") {
        plan = PLANS.STANDARD;
    }

    return {
        plan,
        limits: PLAN_LIMITS[plan],
        isLoaded: true,
    };
};