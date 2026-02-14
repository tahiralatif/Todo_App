# Fixed Signup Function - Copy this to replace your signup function in auth.py

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
    """Register a new user and return JWT token."""
    request_id = generate_request_id()
    client_ip = get_client_ip(request)
    
    logger.info(f"[{request_id}] Signup attempt - IP: {client_ip}")
    
    try:
        # Sanitize inputs
        email = body.email.lower().strip()
        name = body.name.strip()
        
        # Check if email exists
        existing_email = await session.execute(
            select(User).where(User.email == email)
        )
        if existing_email.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        
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
        hashed_password = hash_password(body.password)
        
        # Create user
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            name=name,
            email=email,
            hashed_password=hashed_password
        )
        session.add(user)
        
        # Create signup notification IN SAME TRANSACTION
        from src.models.user import Notification
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
            logger.info(f"[{request_id}] User and notification created: {user_id}")
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
            raise
        
        # Generate JWT token
        token = create_access_token(user.id)
        
        logger.info(f"[{request_id}] Signup completed: {user_id}")
        
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
