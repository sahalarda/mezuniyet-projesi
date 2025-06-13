import jwt from 'jsonwebtoken';

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export const authenticateJWT = (req: any, res: any, next: any) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('No Authorization header found');
            return res.status(401).json({ error: 'No authorization header found' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log('No token found in Authorization header');
            return res.status(401).json({ error: 'No token found in Authorization header' });
        }
        console.log("token", token)

        jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
            if (err) {
                console.log('Token verification failed:', err.message);
                return res.status(403).json({ error: 'Token verification failed' });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};
