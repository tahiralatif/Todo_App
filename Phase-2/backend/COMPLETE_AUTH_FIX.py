# Complete Fixed Auth Routes - Signup & Signin with Notifications
# Copy these functions to replace in your auth.py

# ============================================
# FIXED SIGNUP FUNCTION
# ============================================

@router.post(
    "/signup",
    response_model=SigninResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup(
    request: Request,
    body: SignupRequest,
    session: AsyncSession = Depends(get_session),
) -> SigninResponse:
    """Register a new user and return JWT token with notification."""
    request_id = generate_request_id()
    client_ip = get_client_ip(request)
    
    logger.info(f"[{request_id}] Signup attempt - IP: {client_ip}")
    
    try:
        # Sanitize inputs
        email = body.email.lower().strip()
        name = body.name.strip()
        
        logger.info(f"[{request_id}] Checking if email exists: {email}")
        
        # Check if email exists
        existing_email = await session.execute(
            select(User).where(User.email == email)
        )
        if existing_email.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        
        logger.info(f"[{request_id}] Checking if username exists: {name}")
        
        # Check if username exists
        existing_name = await session.execute(
            select(User).where(User.name == name)
        )
        if existing_name.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists",
            )
        
        # Hash password
        logger.info(f"[{request_id}] Hashing password")
        hashed_password = hash_password(body.password)
        
        # Create user
        user_id = str(uuid.uuid4())
        logger.info(f"[{request_id}] Creating user with ID: {user_id}")
        
        user = User(
            id=user_id,
            name=name,
            email=email,
            hashed_password=hashed_password
        )
        session.add(user)
        
        # Create signup notification IN SAME TRANSACTION
        logger.info(f"[{request_id}] Creating signup notification")
        notification = Notification(
            user_id=user_id,
            type="SIGNUP",
            title="Account Created",
            message=f"Welcome to the app, {name}! Your account has been created.",
            is_read=False,
            task_id=None
        )
        session.add(notification)
        
        # Commit both together
        try:
            await session.commit()
            await session.refresh(user)
            await session.refresh(notification)
            logger.info(f"[{request_id}] User and notification created successfully: {user_id}")
        except IntegrityError as e:
            await session.rollback()
            logger.error(f"[{request_id}] Integrity error: {e}")
            
            error_msg = str(e).lower()
            if "email" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )
            elif "name" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user: Database constraint violation"
                )
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"[{request_id}] Database error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred"
            )
        
        # Generate JWT token
        logger.info(f"[{request_id}] Generating JWT token")
        token = create_access_token(user.id)
        
        # Log successful signup
        log_authentication_event(
            event_type="signup_success",
            user_id=user.id,
            email=user.email,
            ip_address=client_ip,
            success=True
        )
        
        logger.info(f"[{request_id}] Signup completed successfully: {user_id}")
        
        return SigninResponse(
            token=token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                profile_photo_url=None,
                created_at=user.created_at,
            ),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during signup"
        )


# ============================================
# FIXED SIGNIN FUNCTION
# ============================================

@router.post(
    "/signin",
    response_model=SigninResponse,
)
async def signin(
    request: Request,
    body: SigninRequest,
    session: AsyncSession = Depends(get_session),
) -> SigninResponse:
    """Authenticate user and return JWT token with login notification."""
    request_id = generate_request_id()
    client_ip = get_client_ip(request)
    
    logger.info(f"[{request_id}] Signin attempt - IP: {client_ip}")
    
    try:
        # Sanitize email
        email = body.email.lower().strip()
        
        logger.info(f"[{request_id}] Attempting signin for email: {email}")
        
        # Query user from database
        try:
            result = await session.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
        except SQLAlchemyError as e:
            logger.error(f"[{request_id}] Database error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred"
            )
        
        # User not found
        if user is None:
            logger.warning(f"[{request_id}] User not found: {email}")
            log_authentication_event(
                event_type="signin_failed",
                email=email,
                ip_address=client_ip,
                success=False,
                error_message="User not found"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        logger.info(f"[{request_id}] User found: {user.id}")
        
        # Verify password
        password_valid = verify_password(body.password, user.hashed_password)
        
        if not password_valid:
            logger.warning(f"[{request_id}] Invalid password for user: {user.id}")
            log_authentication_event(
                event_type="signin_failed",
                user_id=user.id,
                email=email,
                ip_address=client_ip,
                success=False,
                error_message="Invalid password"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        logger.info(f"[{request_id}] Password verified successfully")
        
        # Create login notification IN SAME TRANSACTION
        logger.info(f"[{request_id}] Creating login notification")
        try:
            notification = Notification(
                user_id=user.id,
                type="LOGIN",
                title="Login Successful",
                message=f"Welcome back, {user.name}!",
                is_read=False,
                task_id=None
            )
            session.add(notification)
            await session.commit()
            await session.refresh(notification)
            logger.info(f"[{request_id}] Login notification created: {notification.id}")
        except Exception as e:
            # Don't fail login if notification fails
            logger.warning(f"[{request_id}] Notification creation failed: {e}")
            await session.rollback()
        
        # Generate JWT token
        logger.info(f"[{request_id}] Generating JWT token")
        token = create_access_token(user.id)
        
        # Log successful signin
        log_authentication_event(
            event_type="signin_success",
            user_id=user.id,
            email=user.email,
            ip_address=client_ip,
            success=True
        )
        
        logger.info(f"[{request_id}] Signin completed successfully: {user.id}")
        
        return SigninResponse(
            token=token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                profile_photo_url=None,
                created_at=user.created_at,
            ),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during signin"
        )


# ============================================
# IMPORTS NEEDED AT TOP OF FILE
# ============================================

"""
Add this import at the top of auth.py if not already there:

from src.models.user import User, Notification
"""
