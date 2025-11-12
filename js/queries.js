// GraphQL queries for Zone01 API

export const queries = {
    // Get user information
    getUserInfo: `
        query {
            user {
                id
                login
                attrs
            }
        }
    `,

    // Get XP transactions
    getXPTransactions: `
        query {
            transaction(
                where: {
                    type: { _eq: "xp" }
                }
                order_by: { createdAt: asc }
            ) {
                id
                amount
                createdAt
                path
                object {
                    name
                    type
                }
            }
        }
    `,

    // Get aggregate XP (total) - not used, manual sum is more reliable
    getXPAggregate: `
        query {
            transaction_aggregate(
                where: {
                    type: { _eq: "xp" }
                }
            ) {
                aggregate {
                    sum {
                        amount
                    }
                }
            }
        }
    `,

    // Get user progress
    getProgress: `
        query {
            progress(order_by: { createdAt: desc }) {
                id
                grade
                createdAt
                path
                object {
                    name
                    type
                }
            }
        }
    `,

    // Get audit transactions (up/down)
    getAuditTransactions: `
        query {
            transaction(
                where: {
                    type: { _in: ["up", "down"] }
                }
            ) {
                type
                amount
            }
        }
    `,

    // Get all skill transactions (skill_go, skill_js, skill_algo, etc.)
    getSkillTransactions: `
        query {
            transaction(
                where: {
                    type: { _like: "skill_%" }
                }
                order_by: { amount: desc }
            ) {
                type
                amount
                createdAt
            }
        }
    `
};

